import * as fse from 'fs-extra'
import * as YAML from 'yaml';
import { ActionsFile } from './models';
import * as crypto from 'crypto'

export async function readActionsFile(filename: string): Promise<ActionsFile> {
    const data = await fse.readFile(filename, 'utf8').then(d => YAML.parse(d) as ActionsFile);
    const actions = data.actions.map((a) => {
        if (a.id) {
            return a;
        } else {
            return {...a, id: crypto.createHash('sha1').update(JSON.stringify(a)).digest('hex') }
        }
    })
    return {actions};
}

