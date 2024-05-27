import { MessageComponentTypes, TextStyles } from "deps.ts";

export class InputTextComponent {
  /**
   * Minimum input length for a text input; min 0, max 4000
   */
  private min_length?: number;
  /**
   * Maximum input length for a text input; min 1, max 4000
   */
  private max_length?: number;
  /**
   * Whether this component is required to be filled (defaults to true)
   */
  private is_required?: boolean;
  /**
   * Pre-filled value for this component; max 4000 characters
   */
  private field_value?: string;
  /**
   * Custom placeholder text if the input is empty; max 100 characters
   */
  private field_placeholder?: string;

  constructor(
    private readonly customId: string,
    private readonly label: string,
    private field_style: TextStyles = TextStyles.Short,
  ) {
  }

  style(value: TextStyles) {
    this.field_style = value;
    return this;
  }

  min(value: number) {
    this.min_length = value;
    return this;
  }

  max(value: number) {
    this.max_length = value;
    return this;
  }

  required() {
    this.is_required = true;
    return this;
  }

  value(value: string) {
    this.field_value = value;
    return this;
  }

  placeholder(value: string) {
    this.field_placeholder = value;
    return this;
  }

  build() {
    return {
      type: MessageComponentTypes.InputText,
      custom_id: this.customId,
      style: this.field_style,
      label: this.label,
      min_length: this.min_length,
      max_length: this.max_length,
      required: this.is_required,
      value: this.field_value,
      placeholder: this.field_placeholder,
    };
  }
}
