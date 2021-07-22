import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui';

export const OfficeBody = ({ changeView, rows = [] }) => {

  return <>
    {
      rows.map((row, key) => {
        return <EuiFlexGroup key={key} className={'wz-margin-0'} style={{
          height: row.height || (150 + 'px')
        }}>
          {
            row.columns.map((column, key) => {
              const growthFactor = Math.max((column.width ? parseInt(column.width / 10) : 1), 1);

              return <EuiFlexItem key={key} grow={growthFactor}>
                <EuiPanel paddingSize={'s'} ><div style={{ height: '100%' }}><column.component onRowClick={() => changeView('drilldown')} /></div></EuiPanel>
              </EuiFlexItem>
            })
          }
        </EuiFlexGroup>
      })
    }
  </>
}