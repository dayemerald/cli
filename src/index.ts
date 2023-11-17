#!/usr/bin/env node
import * as p from "@clack/prompts";
import * as cl from "colorette";
import figlet from "figlet";
import { Command } from "commander";
import gradient from "gradient-string";
import { erase } from "sisteransi";
import * as changeCase from 'change-case'
import { join } from "path";
import { $ } from "execa";

function push<T>(a: T[], n: number): T[] {
    const toBePushed = a.slice(0, n)
    const rest = a.slice(n)
    return [...rest, ...toBePushed]
}

const word = " alexandrite ";
const each: string[] = []
for (let i = 1; i < word.length; i++) {
    const portion = word.slice(0, i);
    const result = figlet.textSync(portion, "Roman");
    each.push(gradient(push(['#bc5bf5', '#69edff', '#69ffd2'], i % 3))(result));
}

const program = new Command()
    .name("alexandrite")
    .description("Alexandria (extension of SapphireJS) command line interface")
    .version("0.0.0");

program
    .command("create", "Create a new Alexandria/Sapphire project")
    .alias("new")
    .action(async () => {
        // Nice fade

        for (const portion of each) {
            console.log(portion)
            await new Promise((r) => setTimeout(r, 100));
            console.log(erase.lines(portion.split("\n").length + 2));
        }

        console.log(gradient(['#bc5bf5', '#69edff', '#69ffd2'])(figlet.textSync(word, 'Roman')));

        p.intro(cl.bgCyanBright(cl.black(" create ")));

        const group = await p.group({
            name: () => p.text({ message: 'What is the name of the project?', validate: (v) => v.length ? undefined : 'The name of the project must be at least one (1) character long!' }),
            config: () => p.select<{ value: string, label: string, hint?: string }[], string>({
                message: 'What format do you want your config file to be in?',
                options: [
                    { value: 'json', label: 'JSON', hint: 'Recommended' },
                    { value: 'yaml', label: 'YAML' }
                ]
            }),
            packageManager: () => p.select<{ value: string, label: string, hint?: string }[], string>({
                message: 'What is your package manager of choice?',
                options: [
                    { value: 'yarn', label: 'Yarn', hint: 'Recommended' },
                    { value: 'npm', label: 'npm' },
                    { value: 'pnpm', label: 'pnpm' },
                    { value: 'bun', label: 'Bun', hint: 'Placeholder, unsupported' }
                ]
            }),
            confirmV4: ({ results }) => results.packageManager === 'yarn' ? p.log.info('Using Yarn V4') : undefined,
            shouldInstall: ({ results }) => p.confirm({ message: `Should we run '${results.packageManager} install' for you?`}),
            orm: () => p.select<{ value: string, label: string, hint?: string }[], string>({
                message: `What is your ORM ${cl.reset(cl.gray('(Object Relational Mapper)'))} of choice?`,
                options: [
                    { value: 'drizzle', label: 'Drizzle', hint: 'Recommended' },
                    { value: 'prisma', label: 'Prisma' },
                ]
            }),
            validateEnv: () => p.confirm({ message: 'Should the environment file be validated? ' }),
            schemaValidator: ({ results }) => results.validateEnv ? p.select<{ value: string, label: string, hint?: string }[], string>({
                message: cl.bold(`What is your schema validator of choice?`),
                options: [
                    { value: 'shapeshift', label: `${cl.gray('@sapphire/')}Shapeshift`, hint: 'Recommended' },
                    { value: 'zod', label: 'Zod' },
                ]
            }) : undefined,
            importAlias: () => p.text({
                message: 'What import alias would you like to use?',
                defaultValue: '~/',
                placeholder: '~/',
                validate: (v) => v.endsWith('/') && !/\w/.test(v) ? undefined : 'You must pass a valid import alias!'
            }),
            helpCommand: () => p.confirm({ message: 'Should a default help command be generated?' }),
            // TODO: Make a sapphirejs plugin that creates a store for categories :)
            // Extend that descriptive interface to make commands pass `usage`, `extendedDescription`, `examples` and `category` which is the Category class from the store
            categoriesExtended: () => p.confirm({ message: 'Should advanced command categories be generated?' }),
            initGit: () => p.confirm({ message: 'Should git be initialized with changes staged?' }),
            additionals: () => p.multiselect<{ value: string, label: string, hint?: string }[], string>({
                message: 'Which additional tools should be added?',
                options: [
                    { value: 'eslint', label: 'ESLint', hint: 'Recommended for large projects' },
                    { value: 'prettier', label: 'Prettier', hint: 'Recommended for large projects' },
                ],
                required: false,
            }),
            howStrictEslint: ({ results }) => results.additionals.includes('eslint') ? p.select<{ value: string, label: string, hint?: string }[], string>({
                message: 'How strict must ESLint be?',
                options: [
                    { value: 'strict', label: 'Strict' },
                    { value: 'stricter', label: 'Stricter', hint: 'Recommended' },
                    { value: 'strictest', label: 'Strictest' }
                ]
            }) : undefined
        }, {
            onCancel: () => {
                p.cancel(cl.red('Operation cancelled.'));
                process.exit(0);
            },
        })

        p.log.info(`Using ${cl.cyan('tsup')} and ${cl.cyan('typescript')} by default!`)

        // Handle

        const directoryName = changeCase.kebabCase(group.name)
        const directory = join(process.cwd(), directoryName)

        const s = p.spinner()
        s.start(cl.bold(`Installing dependencies with ${cl.cyan(group.packageManager)}`))
        // install deps
        $`cd ${directoryName} && `
        s.stop('Dependencies installed successfully!')

        p.outro(`Enter the direction by running \`cd ./${directoryName}\` `);
    });

program.parse();
