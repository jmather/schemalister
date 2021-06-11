#!/usr/bin/env node --max-old-space-size=10240
const debug = require('debug')('run');
const chrono = require('chrono-node');
const datejs = require('datejs');
const Excel = require('exceljs');
const _ = require('lodash');
const cli = require('cli');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const endOfLine = require('os').EOL;
const crypto = require('crypto');
const Program = require('./lib/main');

cli.parse({
    'input': ['i', 'Input File', 'file', null],
    'output': ['o', 'Output File', 'file', null],
    'force': ['f', 'Force output over-write', 'boolean', false],
    'pretty': ['p', 'Pretty-print spaces (0 to disable)', 'integer', 2],
});

cli.main(async (args, opts) => {
    if (! opts.input) {
        cli.error('You did not specify an input file.');
        cli.getUsage();
        return;
    }
    if (! fs.existsSync(opts.input)) {
        cli.error(`Could not find: ${opts.input}`);
        return;
    }

    if (! opts.output) {
        const ext = path.extname(opts.input);
        const dir = path.dirname(opts.input);
        const out = path.join(dir, path.basename(opts.input, ext) + '.json');
        cli.info(`Output not defined, defaulting to ${out}`);
        opts.output = out;
    }

    if (fs.existsSync(opts.output) && opts.force === false) {
        cli.error(`Output file exits! Use -f|--force to force overwriting.`);
        return;
    }

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(opts.input);

    const program = new Program();
    const result = await program.run(workbook);
    fs.writeFileSync(opts.output, JSON.stringify(result, null, opts.pretty));
    cli.output(`Wrote output to: ${opts.output}`);
});