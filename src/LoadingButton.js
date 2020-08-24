import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    minWidth: 120,
    alignSelf: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  disabledButton: {
    backgroundColor: 'white',
  },
  secondary: {
    backgroundColor: 'white',
    color: theme.palette.primary.main,
    borderWidth: 1,
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
    minWidth: 120,
  },
  link: {
    backgroundColor: 'white',
    color: theme.palette.primary.main,
    minWidth: 120,
  },
}));

const LoadingButton = ({
  children, onPress, loading, type, secondary, link, style, disabled,
}) => {
  const classes = useStyles();
  const customClass = secondary ? classes.secondary : classes.link;
  const buttonClass = secondary || link ? customClass : classes.button;

  return (
    <div className={classes.wrapper}>
      <Button
        style={style}
        onClick={onPress}
        className={buttonClass}
        disabled={loading || disabled}
        type={type}
        classes={{
            disabled: classes.disabledButton,
          }}
      >
        {children}
      </Button>
      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
  );
};

export default LoadingButton;

