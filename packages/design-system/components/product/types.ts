"use client"

import type { Control, FieldPath, FieldValues } from "react-hook-form"

export type ProductFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  description?: string
  disabled?: boolean
  label?: string
  name: TName
}

export type ProductSelectOption = {
  label: string
  value: string
}

export type ProductImageValue = {
  fileName: string
  objectKey: string
  src: string
}
