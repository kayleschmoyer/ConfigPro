import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

import { ThemeProvider } from '../../app/providers/ThemeProvider';

export interface MockProviderConfig {
  route?: string;
  routerProps?: Omit<MemoryRouterProps, 'children'>;
}

export const createMockProviders = ({ route = '/', routerProps }: MockProviderConfig = {}) => {
  const initialEntries = routerProps?.initialEntries ?? [route];
  const initialIndex = routerProps?.initialIndex;

  const ProviderWrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    </ThemeProvider>
  );

  return { Wrapper: ProviderWrapper };
};

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  routerProps?: MockProviderConfig['routerProps'];
  wrapper?: (props: { children: ReactNode }) => JSX.Element;
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderWithProvidersOptions,
) => {
  const { route, routerProps, wrapper: CustomWrapper, ...renderOptions } = options ?? {};
  const { Wrapper } = createMockProviders({ route, routerProps });

  const CombinedWrapper = ({ children }: { children: ReactNode }) => (
    <Wrapper>
      {CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}
    </Wrapper>
  );

  return render(ui, { wrapper: CombinedWrapper, ...renderOptions });
};
