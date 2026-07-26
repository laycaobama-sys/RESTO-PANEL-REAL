import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // Strict React Hooks rules — kept on to enforce the rules-of-hooks + refs
    // discipline that the chart utilities rely on. The recommended preset of
    // eslint-plugin-react-hooks@7 enables `purity` and `exhaustive-deps`; we
    // relax those so existing files that legitimately use `Date.now()` /
    // `Math.random()` for ids in event handlers (not during render) don't
    // surface false positives.
    "react-hooks/refs": "error",
    "react-hooks/immutability": "error",
    "react-hooks/purity": "off",
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/set-state-in-render": "off",
    "react-hooks/set-state-in-effect": "off",
    "react-compiler/react-compiler": "off",

    // TypeScript — keep loose (matches eslint.config.mjs baseline).
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",

    // React — match .mjs baseline.
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",

    // Next.js — match .mjs baseline.
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",

    // General JS — match .mjs baseline.
    "prefer-const": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-empty": "off",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-useless-escape": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills"]
}];

export default eslintConfig;
