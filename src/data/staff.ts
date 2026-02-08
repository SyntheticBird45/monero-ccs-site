import type { ImageMetadata } from "astro";

import luigiImage from "../assets/luigi1111.png";
import plowsoffImage from "../assets/plowsoff.png";

export type Member = {
  name: string;
  role: string;
  image: ImageMetadata;
  gitlab: string;
};

export const members = [
  {
    name: "plowsoff",
    role: "Coordinator",
    image: plowsoffImage,
    gitlab: "plowsoff",
  },
  {
    name: "luigi1111",
    role: "Maintainer",
    image: luigiImage,
    gitlab: "luigi1111",
  },
];
