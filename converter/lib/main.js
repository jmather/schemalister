const Workbook = require('exceljs/lib/doc/workbook');
const Row = require('exceljs/lib/doc/row');

/**
 * @typedef {Object} FieldData
 * @property {string} Label
 * @property {string} DeveloperName
 * @property {string} DataType
 * @property {string|string[]} DataTypeAttributes
 * @property {string} HelpText
 * @property {string} Formula
 * @property {string} Attributes
 * @property {Object<string, string[]>} FieldUsage
 *
 * @
 */

/**
 * @typedef {Object} ObjectData
 * @property {string} WorksheetId
 * @property {string} Label
 * @property {Object<string, FieldData>} Fields
 */

/**
 * @typedef {Object} ProgramData
 * @property {Object<string, ObjectData>} Objects
 * @property {Object<string, string[]>} Enums
 */

module.exports = class Program {
    /**
     *
     * @param {Workbook} workbook
     * @returns {ProgramData}
     */
    async run(workbook) {
        const data = {
            Objects: {},
        };

        // specifically done because it says to use workbook.eachSheet but
        // i can't confirm workbook.eachSheet supports promises. Can't find it.
        // At all.
        for (let i = 0; i < workbook.worksheets.length; i++) {
            const worksheet = workbook.worksheets[i];
            data.Objects[worksheet.name] = await this.processWorksheet(worksheet, data);
        }

        return data;
    }

    /**
     *
     * @param {Worksheet} worksheet
     * @param {ProgramData} data
     * @returns {ObjectData}
     */
    async processWorksheet(worksheet, data) {
        /** @var {ObjectData} obj */
        const obj = {
            WorksheetId: worksheet.id,
            Label: worksheet.name,
            Fields: {},
        };

        for (let i = 2; i < worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const name = row.getCell('B').toString();
            obj.Fields[name] = this.processRow(row, obj, data);
        }

        return obj;
    }

    /**
     *
     * @param {Row} row
     * @param {ObjectData} obj
     * @param {ProgramData} data
     * @returns {FieldData}
     */
    processRow(row, obj, data) {
        /** @var {FieldData} field */
        const field = {
            Label: row.getCell('A').toString(),
            DeveloperName: row.getCell('B').toString(),
            DataType: row.getCell('C').toString(),
            HelpText: row.getCell('D').toString(),
            Formula: row.getCell('E').toString(),
            Attributes: row.getCell('F').toString(),
            FieldUsage: {},
        };

        const typeCheck = /^(.*) \((.*)\)$/;
        const matcher = (field && field.DataType) ? field.DataType.match(typeCheck) : null;

        if (matcher) {
            field.DataType = matcher[1];
            field.DataTypeAttributes = matcher[2];
        }

        if (field.DataType === 'Picklist') {
            field.DataType = 'Enum';
            field.DataTypeAttributes = field.DataTypeAttributes.split('; ');
        }

        const usage = row.getCell('G').toString();
        if (usage && usage.trim() === '') {
            return field;
        }

        const lines = usage.split(/(\r\n|\n)/);
        let currentSection = null;
        lines.forEach(line => {
            if (line.startsWith('- ') && currentSection != null) {
                field.FieldUsage[currentSection].push(line.substr(2));
            } else if (line && line.trim() !== '') {
                currentSection = line.trim();
                field.FieldUsage[currentSection] = [];
            }
        });

        if (field.DataType === 'Picklist)') {
            field.DataType = 'Picklist';
            const msg = 'Valid Entries Unknown.';
            if (field.DataTypeAttributes && field.DataTypeAttributes instanceof String) {
                field.DataTypeAttributes = msg + ' ' + field.DataTypeAttributes;
            }

            if (field.DataTypeAttributes && field.DataTypeAttributes instanceof Array) {
                field.DataTypeAttributes.unshift(msg);
            }
        }

        return field;
    }
};
