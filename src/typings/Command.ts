export enum ParameterType {
  STRING,
  INTEGER,
  FLOAT,
  MEMBER,
  CHANNEL,
}

export interface Parameter {
  name: string;
  description: string;
  required: boolean;
  type: ParameterType;
  dev?: boolean;
}
