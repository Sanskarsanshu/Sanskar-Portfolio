import {
  siCplusplus,
  siCss,
  siDocker,
  siFastapi,
  siGit,
  siHtml5,
  siJavascript,
  siLinux,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siTypescript,
} from "simple-icons";

export type SkillIcon = {
  title: string;
  slug: string;
  path: string;
  hex: string;
};

// 3×5 grid — consumed by the 3D keyboard (one icon per keycap)
export const SKILLS_GRID: readonly (readonly SkillIcon[])[] = [
  [siPython, siCplusplus, siJavascript, siTypescript, siLinux],
  [siReact, siNextdotjs, siHtml5, siCss, siNodedotjs],
  [siFastapi, siPostgresql, siRedis, siDocker, siGit],
] as const;

export const SKILLS_FLAT: readonly SkillIcon[] = SKILLS_GRID.flat();
