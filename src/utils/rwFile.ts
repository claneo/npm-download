import fs from 'fs';

export const get = (file: string) => {
  try {
    const configFileData = fs.readFileSync(file, 'utf8');
    return JSON.parse(configFileData);
  } catch (e) {
    return undefined;
  }
};
export const set = (file: string, content: any) => {
  fs.writeFileSync(file, JSON.stringify(content, undefined, 4));
};
