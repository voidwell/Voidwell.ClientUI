import { PlatformType } from "./platform-type.model";

export interface PlatformOption {
  type: PlatformType,
  name: string,
  icon: string
}

export const PlatformOptions: PlatformOption[] = [
  {
    type: PlatformType.PC,
    name: 'PC',
    icon: 'mdi-microsoft-windows'
  },
  {
    type: PlatformType.PS4US,
    name: 'PS4-US',
    icon: 'mdi-sony-playstation'
  },
  {
    type: PlatformType.PS4EU,
    name: 'PS4-EU',
    icon: 'mdi-sony-playstation'
  }
];