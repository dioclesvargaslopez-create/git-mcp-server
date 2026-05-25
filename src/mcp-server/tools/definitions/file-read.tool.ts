import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { withToolAuth } from '@/mcp-server/transports/auth/lib/withAuth.js';
import { PathSchema } from '../schemas/common.js';
import type { ToolDefinition } from '../utils/toolDefinition.js';
import { createToolHandler, type ToolLogicDependencies } from '../utils/toolHandlerFactory.js';
import { createJsonFormatter } from '../utils/json-response-formatter.js';

const TOOL_NAME = 'file_read';
const TOOL_TITLE = 'File Read';
const TOOL_DESCRIPTION = 'Read the content of a file inside the repository.';

const InputSchema = z.object({
  path: PathSchema,
  filePath: z.string().min(1).describe('Relative path of the file to read (relative to repository root).'),
  encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding.'),
}).strict();

const OutputSchema = z.object({
  success: z.boolean(),
  filePath: z.string(),
  content: z.string(),
  sizeBytes: z.number(),
});

type ToolInput = z.infer<typeof InputSchema>;
type ToolOutput = z.infer<typeof OutputSchema>;

async function fileReadLogic(
  input: ToolInput,
  { targetPath }: ToolLogicDependencies,
): Promise<ToolOutput> {
  const absolutePath = path.resolve(targetPath, input.filePath);
  if (!absolutePath.startsWith(path.resolve(targetPath))) {
    throw new Error('Path traversal detected: file must be inside the repository.');
  }
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${input.filePath}`);
  }
  const buffer = fs.readFileSync(absolutePath);
  const content = input.encoding === 'base64'
    ? buffer.toString('base64')
    : buffer.toString('utf8');
  return {
    success: true,
    filePath: input.filePath,
    content,
    sizeBytes: buffer.length,
  };
}

const responseFormatter = createJsonFormatter<ToolOutput>({});

export const fileReadTool: ToolDefinition<typeof InputSchema, typeof OutputSchema> = {
  name: TOOL_NAME,
  title: TOOL_TITLE,
  description: TOOL_DESCRIPTION,
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  annotations: { readOnlyHint: true },
  logic: withToolAuth(['tool:git:read'], createToolHandler(fileReadLogic)),
  responseFormatter,
};