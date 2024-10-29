import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';
import type {CSSObject} from 'tss-react';
import type {Eip712TypedData} from 'web3';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(1),
    textAlign: 'left',
    alignItems: 'left',
    justifyContent: 'left',
  },
  objectContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  childContainer: {
    display: 'flex',
  },
  text: {
    marginBottom: theme.spacing(0.5),
    ...theme.typography.body2,
  } as CSSObject, // Ensuring the type compatibility "typography.body2" from @mui with "CSSObject"
  objectKey: {
    fontWeight: 'bold',
  },
  valueKey: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    color: theme.palette.neutralShades[500],
  },
}));

interface TypedMessageProps {
  typedData: Eip712TypedData;
}

export const TypedMessage: React.FC<TypedMessageProps> = ({typedData}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();

  const renderChildren = (child: Record<string, unknown>) => {
    return (
      <Box className={classes.container}>
        {Object.entries(child).map(entry => {
          const k = entry[0];
          const v = entry[1];
          switch (typeof v) {
            case 'string':
            case 'number':
            case 'bigint':
            case 'boolean':
              return (
                <Box className={classes.childContainer}>
                  <Typography
                    className={cx(classes.text, classes.valueKey)}
                    mr={1}
                  >
                    {k}:
                  </Typography>
                  <Typography className={classes.text}>{v}</Typography>
                </Box>
              );
            case 'object':
              return (
                <Box className={classes.objectContainer}>
                  <Typography className={cx(classes.text, classes.objectKey)}>
                    {k}:
                  </Typography>
                  {v
                    ? Array.isArray(v)
                      ? v.map((arrayValue, arrayIndex) => (
                          <Box className={classes.container}>
                            <Typography
                              className={cx(classes.text, classes.objectKey)}
                            >
                              {arrayIndex}:
                            </Typography>
                            {renderChildren(arrayValue)}
                          </Box>
                        ))
                      : renderChildren(v as Record<string, unknown>)
                    : null}
                </Box>
              );
            default:
              return null;
          }
        })}
      </Box>
    );
  };

  return (
    <Box className={classes.container}>
      <Typography variant="h6" mb={1}>
        {t('common.domain')}
      </Typography>
      <Box ml={-1} mb={1}>
        {renderChildren(typedData.domain)}
      </Box>
      <Typography variant="h6" mb={1}>
        {typedData.primaryType}
      </Typography>
      <Box ml={-1}>{renderChildren(typedData.message)}</Box>
    </Box>
  );
};
