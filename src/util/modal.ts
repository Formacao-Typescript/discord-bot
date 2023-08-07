import { InputTextComponent } from "./components/text-input.ts";

export class Modal {
  private components = [] as InputTextComponent[];

  constructor(
    private readonly customId: string,
    private readonly title: string,
  ) {}

  textInput(input: InputTextComponent) {
    if (this.components.length >= 5) {
      throw new Error(`you tried to register more than 5 components for the ${this.customId} modal.`);
    }

    this.components.push(input);

    return this;
  }

  build() {
    return {
      title: this.title,
      custom_id: this.customId,
      components: [{ type: 1, components: this.components.map((component) => component.build()) }],
    };
  }
}
