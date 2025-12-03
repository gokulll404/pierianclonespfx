import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import App from '../../App';
import * as React from 'react';

import { SPComponentLoader } from '@microsoft/sp-loader';
import { initializeIcons } from '@fluentui/react/lib/Icons';

// ⭐ PnPJS imports
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

export interface IPierianWebPartProps {
  description: string;
}

export default class PierianWebPart extends BaseClientSideWebPart<IPierianWebPartProps> {

  private _sp: SPFI; // ⭐ Store SPFI instance here

  public onInit(): Promise<void> {
    return super.onInit().then(_ => {

      // ⭐ Initialize PnPJS correctly
      this._sp = spfi().using(SPFx(this.context));

      // ----------------------------------------
      // Load Google Outfit Font
      // ----------------------------------------
      SPComponentLoader.loadCss(
        "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
      );

      // ----------------------------------------
      // Initialize Fluent UI Icons
      // ----------------------------------------
      initializeIcons();
    });
  }

  public render(): void {
    try {
      const element: React.ReactElement<any> = React.createElement(
        App,
        {
          sp: this._sp,        // ⭐ FIX — pass proper SPFI instance
          context: this.context
        }
      );

      ReactDom.render(element, this.domElement);
    } catch (error) {
      console.error('Error rendering web part:', error);
      this.domElement.innerHTML = `
      <div style="padding: 20px; border: 1px solid #dc3545; background: #f8d7da; color: #721c24; border-radius: 4px;">
        <h3>Web Part Loading Error</h3>
        <p>There was an issue loading the web part content.</p>
        <small>Error: ${error?.message || 'Unknown error occurred'}</small>
      </div>`;
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'WebPart Settings' },
          groups: [
            {
              groupName: 'General',
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
