import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@material/mwc-tab";
import "@material/mwc-tab-bar";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../components/ha-menu-button";
import "../../layouts/ha-app-layout";
import { mdiCog } from "@mdi/js";

import { haStyle } from "../../resources/styles";
import "../lovelace/views/hui-view";
import { HomeAssistant } from "../../types";
import { Lovelace } from "../lovelace/types";
import { LovelaceConfig } from "../../data/lovelace";

const LOVELACE_CONFIG: LovelaceConfig = {
  views: [
    {
      strategy: {
        type: "energy",
      },
    },
  ],
};

@customElement("ha-panel-energy")
class PanelEnergy extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean, reflect: true }) public narrow!: boolean;

  @state() private _viewIndex = 0;

  @state() private _lovelace?: Lovelace;

  public willUpdate(changedProps: PropertyValues) {
    if (!this.hasUpdated) {
      this.hass.loadFragmentTranslation("lovelace");
    }
    if (!changedProps.has("hass")) {
      return;
    }
    const oldHass = changedProps.get("hass") as this["hass"];
    if (oldHass?.locale !== this.hass.locale) {
      this._setLovelace();
    }
  }

  protected render(): TemplateResult {
    return html`
      <ha-app-layout>
        <app-header fixed slot="header">
          <app-toolbar>
            <ha-menu-button
              .hass=${this.hass}
              .narrow=${this.narrow}
            ></ha-menu-button>
            <div main-title>${this.hass.localize("panel.energy")}</div>
            <a href="/config/energy?historyBack=1">
              <mwc-icon-button>
                <ha-svg-icon .path=${mdiCog}></ha-svg-icon>
              </mwc-icon-button>
            </a>
          </app-toolbar>
        </app-header>
        <hui-view
          .hass=${this.hass}
          .narrow=${this.narrow}
          .lovelace=${this._lovelace}
          .index=${this._viewIndex}
          @reload-energy-panel=${this._reloadView}
        ></hui-view>
      </ha-app-layout>
    `;
  }

  private _setLovelace() {
    this._lovelace = {
      config: LOVELACE_CONFIG,
      rawConfig: LOVELACE_CONFIG,
      editMode: false,
      urlPath: "energy",
      mode: "generated",
      locale: this.hass.locale,
      enableFullEditMode: () => undefined,
      saveConfig: async () => undefined,
      deleteConfig: async () => undefined,
      setEditMode: () => undefined,
    };
  }

  private _reloadView() {
    // Force strategy to be re-run by make a copy of the view
    const config = this._lovelace!.config;
    this._lovelace = {
      ...this._lovelace!,
      config: { ...config, views: [{ ...config.views[0] }] },
    };
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        mwc-icon-button {
          color: var(--text-primary-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-panel-energy": PanelEnergy;
  }
}

declare global {
  interface HASSDomEvents {
    "reload-energy-panel": undefined;
  }
}
