
import { toast } from 'sonner';

interface TableauEmbedOptions {
  container: HTMLDivElement;
  embedCode: string;
  onError?: (error: Error) => void;
}

export enum TableauLoadError {
  INITIALIZATION_FAILED = 'initialization_failed',
  SCRIPT_EXECUTION_FAILED = 'script_execution_failed',
  ELEMENT_NOT_FOUND = 'element_not_found',
  NETWORK_ERROR = 'network_error',
  INVALID_URL = 'invalid_url',
}

export const initializeTableauEmbed = ({
  container,
  embedCode,
  onError,
}: TableauEmbedOptions): void => {
  try {
    // Clear previous content
    container.innerHTML = '';
    
    // Create a wrapper div with proper dimensions
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'tableau-wrapper';
    wrapperDiv.style.width = '100%';
    wrapperDiv.style.height = '100%';
    wrapperDiv.style.overflow = 'auto';
    
    // Insert the embed code HTML
    wrapperDiv.innerHTML = embedCode;
    container.appendChild(wrapperDiv);
    
    // Find and execute all scripts in the embed code
    const scripts = wrapperDiv.getElementsByTagName('script');
    
    if (scripts.length === 0) {
      console.warn('No scripts found in Tableau embed code');
    }
    
    Array.from(scripts).forEach(oldScript => {
      try {
        const newScript = document.createElement('script');
        
        // Copy all attributes from the old script to the new script
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy the content of the script
        newScript.innerHTML = oldScript.innerHTML;
        
        // Replace the old script with the new one to execute it
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      } catch (scriptError) {
        console.error('Error executing script in Tableau embed:', scriptError);
        onError?.(new Error(TableauLoadError.SCRIPT_EXECUTION_FAILED));
      }
    });
    
    // Fix any tableau viz elements that need responsive sizing
    applyTableauResponsiveStyles(wrapperDiv);
    
    console.log('Tableau embed initialized successfully');
  } catch (error) {
    console.error('Error initializing Tableau embed:', error);
    onError?.(error instanceof Error ? error : new Error(TableauLoadError.INITIALIZATION_FAILED));
  }
};

export const applyTableauResponsiveStyles = (container: HTMLElement): void => {
  setTimeout(() => {
    try {
      const tableauVizElements = container.getElementsByClassName('tableauViz');
      
      if (tableauVizElements.length > 0) {
        Array.from(tableauVizElements).forEach((vizElement: any) => {
          if (vizElement.style) {
            // Make tableau visualizations responsive
            vizElement.style.width = '100%';
            vizElement.style.minHeight = '500px';
            vizElement.style.height = '100%';
            
            // Ensure proper scaling on different devices
            const parentElement = vizElement.parentElement;
            if (parentElement) {
              parentElement.style.width = '100%';
              parentElement.style.height = '100%';
            }
          }
        });
        console.log(`Applied responsive styles to ${tableauVizElements.length} Tableau viz elements`);
      } else {
        console.warn('No Tableau visualization elements found to apply responsive styling');
      }
    } catch (error) {
      console.error('Error applying responsive styles to Tableau viz:', error);
    }
  }, 1000);
};

export const getErrorMessageForTableauError = (errorType: TableauLoadError): string => {
  switch (errorType) {
    case TableauLoadError.INITIALIZATION_FAILED:
      return 'Failed to initialize the dashboard. Please try refreshing the page.';
    case TableauLoadError.SCRIPT_EXECUTION_FAILED:
      return 'Error executing the dashboard scripts. Try disabling any ad blockers and refresh.';
    case TableauLoadError.ELEMENT_NOT_FOUND:
      return 'Dashboard elements could not be found. Please contact support.';
    case TableauLoadError.NETWORK_ERROR:
      return 'Network error loading the dashboard. Check your internet connection and try again.';
    case TableauLoadError.INVALID_URL:
      return 'The dashboard URL is invalid or improperly formatted. Please verify the URL and try again.';
    default:
      return 'An unknown error occurred with the dashboard. Please try refreshing the page.';
  }
};
