import React from 'react';
import { AppMountParameters } from 'opensearch-dashboards/public';
import ReactDOM from 'react-dom';
import { AppProps } from '../../../../../../wazuh-core/public/services/application/types';
import { Office365App } from './office-365-app';

export const renderApp = async (
  params: AppMountParameters,
  { Layout }: AppProps,
) => {
  ReactDOM.render(
    <Layout>
      <Office365App params={params} />
    </Layout>,
    params.element,
  );

  return () => ReactDOM.unmountComponentAtNode(params.element);
};
