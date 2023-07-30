type TransformationFunction = (body: string) => string;
export function applyTransformationsToString(
  body: string,
  transformations: TransformationFunction[],
) {
  // each transformation function is applied to the string in order
  // the result of the previous transformation is passed to the next
  for (const transformation of transformations) {
    body = transformation(body);
  }

  return body;
}
