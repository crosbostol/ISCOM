import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginReactQuery } from '@kubb/plugin-react-query';

export default defineConfig({
    root: '.',
    input: {
        path: 'http://localhost:3000/api-docs-json',
    },
    output: {
        path: './src/api/generated',
        clean: true,
    },
    plugins: [
        pluginOas(),
        pluginTs({
            output: {
                path: './models',
            },
        }),
        pluginZod({
            output: {
                path: './zod',
            },
        }),
        pluginReactQuery({
            output: {
                path: './hooks',
            },
            client: {
                importPath: '../../axios', // Relative path from generated hooks to axios instance
            },
        }),
    ],
});
