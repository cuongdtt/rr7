import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Await, Link as ReactRouterLink } from 'react-router';
import ProTip from '~/components/ProTip';
import Copyright from '~/components/Copyright';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export function meta() {
  return [
    { title: 'About' },
    {
      name: 'description',
      content: 'About the project',
    },
  ];
}

const TitleCustom = styled(Typography)({
  color: 'red',
  fontSize: '2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: '2rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  textDecoration: 'underline',
});

export async function loader() {
  // Only critical data here
  const criticalData = await new Promise(res =>
    setTimeout(() => res("critical"), 100)
  );
  const nonCriticalData = new Promise(res =>
    setTimeout(() => res("nonCriticalData"), 4000)
  );
  return { criticalData, nonCriticalData };
}

export default function About({ loaderData }) {
  // Non-critical data fetched in component with Suspense
  const { criticalData, nonCriticalData } = loaderData;

  return (
    <div>
      <TitleCustom>{criticalData}</TitleCustom>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Await resolve={nonCriticalData}>
          {value => <h1>{value}</h1>}
        </Await>
      </React.Suspense>
      <Button onClick={() => {
        console.log('clicked');
      }}>
        Click me
      </Button>
      <ProTip />
      <Copyright />
    </div>
  );
}
