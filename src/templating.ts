import Handlebars from 'handlebars';

const createTemplate = (run: string) =>
  Handlebars.compile(run, { noEscape: true });

export const getExpandedName = (name: string, context: any): string => {
  const template = createTemplate(name);
  const expandedName = template(context).trim();
  return expandedName;
};

export const getCommandLines = (run: string, context: any): string[] => {
  const template = createTemplate(run);
  const lines = template(context)
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return lines;
};
