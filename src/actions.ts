import * as fse from 'fs-extra'
import * as YAML from 'yaml';
import { ActionsFile } from './models';

export async function readActionsFile(filename: string): Promise<ActionsFile> {
    const data = await fse.readFile(filename, 'utf8');
    return YAML.parse(data);
}
