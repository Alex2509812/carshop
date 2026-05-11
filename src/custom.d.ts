declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
interface ImportMeta {
  readonly env: Record<string, string>;
}