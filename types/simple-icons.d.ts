declare module "simple-icons" {
  export interface SimpleIcon {
    title: string;
    slug: string;
    path: string;
    hex: string;
  }
  export const siCplusplus: SimpleIcon;
  export const siCss: SimpleIcon;
  export const siDocker: SimpleIcon;
  export const siFastapi: SimpleIcon;
  export const siGit: SimpleIcon;
  export const siHtml5: SimpleIcon;
  export const siJavascript: SimpleIcon;
  export const siLinux: SimpleIcon;
  export const siNextdotjs: SimpleIcon;
  export const siNodedotjs: SimpleIcon;
  export const siPostgresql: SimpleIcon;
  export const siPython: SimpleIcon;
  export const siReact: SimpleIcon;
  export const siRedis: SimpleIcon;
  export const siTypescript: SimpleIcon;
  const icons: Record<string, SimpleIcon>;
  export default icons;
}
