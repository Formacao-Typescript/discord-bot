import { ButtonComponent as DiscordButtonComponent, ButtonStyles, MessageComponentTypes } from "deps.ts";

export class ButtonComponent {
  private button: Omit<DiscordButtonComponent, "customId"> & { custom_id?: string } = {
    type: MessageComponentTypes.Button,
    label: "",
    style: ButtonStyles.Primary,
  };

  constructor(id: string) {
    this.button.custom_id = id;
  }

  /**
   * Set the button style
   * @param value Chosen button style
   */
  style(value: ButtonStyles) {
    this.button.style = value;
    return this;
  }

  /**
   * Text that appears on the button; max 80 characters
   * @param value value to set
   */
  label(value: string) {
    this.button.label = value;
    return this;
  }

  /**
   * emoji	name, id, and animated
   * @param value value to set
   */
  emoji(value: { id?: bigint; name?: string; animated?: boolean }) {
    this.button.emoji = value;
    return this;
  }

  /**
   * URL for link-style buttons
   * @param value value to set
   */
  url(value: string) {
    this.button.url = value;
    return this;
  }

  /**
   * Whether the button is disabled (defaults to false)
   * @param value value to set
   */
  disabled(value: boolean) {
    this.button.disabled = value;
    return this;
  }

  build() {
    return { ...this.button };
  }
}
