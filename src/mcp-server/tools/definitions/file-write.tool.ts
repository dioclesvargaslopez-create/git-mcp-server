import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { withToolAuth } from '@/mcp-server/transports/auth/lib/withAuth.js';
import { PathSchema } from '../schemas/common.js';
import type { ToolDefinition } from '../utils/toolDefinition.js';
import { createToolHandler, type ToolLogicDependencies } from '../utils/toolHandlerFactory.js';
import { createJsonFormatter } from '../utils/json-response-formatter.js';

const TOOL_NAME = 'file_write';
const TOOL_TITLE = 'File Write';
const TOOL_DESCRIPTION = 'Write or overwrite a file with the given content. Creates parent directories if needed.';

const InputSchema = z.object({
  path: PathSchema,
  filePath: z.string().min(1).describe('Relative path of the file to write (relative to repository root).'),
  content: z.string().describe('Content to write to the file.'),
  encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding.'),
}).strict();

const OutputSchema = z.object({
  success: z.boolean(),
  filePath: z.string(),
  bytesWritten: z.number(),
  message: z.string(),
});

type ToolInput = z.infer<typeof InputSchema>;
type ToolOutput = z.infer<typeof OutputSchema>;

async function fileWriteLogic(
  input: ToolInput,
  { targetPath }: ToolLogicDependencies,
): Promise<ToolOutput> {
  const absolutePath = path.resolve(targetPath, input.filePath);
  if (!absolutePath.startsWith(path.resolve(targetPath))) {
    throw new Error('Path traversal detected: file must be inside the repository.');
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(input.content, input.encoding === 'base64' ? 'base64' : 'utf8');
  fs.writeFileSync(absolutePath, buffer);
  return {
    success: true,
    filePath: input.filePath,
    bytesWritten: buffer.length,
    message: `File written successfully: ${input.filePath}`,
  };
}

const responseFormatter = createJsonFormatter<ToolOutput>({});

export const fileWriteTool: ToolDefinition<typeof InputSchema, typeof OutputSchema> = {
  name: TOOL_NAME,
  title: TOOL_TITLE,
  description: TOOL_DESCRIPTION,
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  annotations: { readOnlyHint: false },
  logic: withToolAuth(['tool:git:write'], createToolHandler(fileWriteLogic)),
  responseFormatter,
};