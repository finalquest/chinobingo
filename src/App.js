import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import {
  DatePicker,
  TimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import { Container, Box, Typography, Button, Switch, Slider, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import LoadingButton from './LoadingButton';

import apiCall from './api/api';

const useStyles = makeStyles(theme => ({
  boxContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
  },
  headerButtonContainer: {
    flex: 0.5,
    margin: theme.spacing(1),
  },
  button: {
    width: '100%',
  },
  tabsContainer: {
    backgroundColor: '#F7F7F7',
  },
  imageIcon: {
    height: 100,
    alignSelf: 'center',
    display: 'flex',
    padding: 20,
  },
  textField: {
    margin: theme.spacing(1),
    width: '100%',
  },
}));

const App = () => {
  const classes = useStyles();
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthHour, setBirthHour] = useState(new Date());
  const [baldy, setBaldy] = useState(false);
  const [step, setStep] = useState(0);
  const [argenchino, setArgenchino] = useState(false);
  const [weigth, setWeigth] = useState(0);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [success, setSuccess] = useState(false);

  const lastStep = 5;

  const titles = [
    'Eleji la fecha de nacimiento',
    'Eleji la hora de nacimiento',
    'Pelon o con pelo',
    'Chino o Argenchino',
    'Cuanto pesa?',
  ];

  const validate = () => {
    if (name === '') {
      setNameError(true);
    }

    return name !== '';
  };

  const postAnswer = () => {
    if (!validate()) return;
    setLoading(true);
    apiCall(
      process.env.REACT_APP_ENDPOINT,
      'answer',
      {
        name, birthDate, birthHour, baldy, argenchino, weigth,
      },
      { type: 'commit' },
    ).then(() => {
      setLoading(false);
      setSuccess(true);
      console.log('success');
    }).catch((error) => {
      setLoading(false);
      console.log(error);
    });
  };


  const steps = [
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        value={birthDate}
        onChange={setBirthDate}
        variant="static"
        openTo="date"
      />
    </MuiPickersUtilsProvider>,
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <TimePicker
        value={birthHour}
        onChange={setBirthHour}
        variant="static"
        openTo="date"
      />
    </MuiPickersUtilsProvider>,
    <Box style={{
        flexDirection: 'row',
        justifyContent: 'center',
        display: 'flex',
        alignItes: 'center',
        }}
    >
      <Button
        onClick={() => {
          setBaldy(false);
        }}
      >
        <img className={classes.imageIcon} alt="No hay campañas creadas" src="/pelon.png" />
      </Button>
      <Box style={{ alignItems: 'center', display: 'flex' }}>
        <Switch
          checked={baldy}
          onChange={setBaldy}
          name="checkedA"
          inputProps={{ 'aria-label': 'secondary checkbox' }}
        />
      </Box>
      <Button
        onClick={() => {
          setBaldy(true);
        }}
      >
        <img className={classes.imageIcon} alt="No hay campañas creadas" src="/noPelon.png" />
      </Button>
    </Box>,
    <Box style={{
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
      alignItes: 'center',
      }}
    >
      <Button
        onClick={() => {
          setArgenchino(false);
      }}
      >
        <img className={classes.imageIcon} alt="No hay campañas creadas" src="/chino.png" />
      </Button>
      <Box style={{ alignItems: 'center', display: 'flex' }}>
        <Switch
          checked={argenchino}
          onChange={setArgenchino}
          name="checkedA"
          inputProps={{ 'aria-label': 'secondary checkbox' }}
        />
      </Box>
      <Button
        onClick={() => {
          setArgenchino(true);
      }}
      >
        <img className={classes.imageIcon} alt="No hay campañas creadas" src="/argenchino.png" />
      </Button>
    </Box>,
    <Box style={{
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
      alignItes: 'center',
      }}
    >
      <Typography
        component="p"
        style={{
            textAlign: 'center', margin: 10, alignSelf: 'center',
            }}
      >
        Normal
      </Typography>
      <Box style={{ alignItems: 'center', display: 'flex', flex: 1 }}>
        <Slider
          defaultValue={2500}
          step={50}
          marks
          min={2500}
          max={3500}
          valueLabelDisplay="auto"
          onChangeCommitted={(_, value) => {
            console.log(value);
            setWeigth(value);
          }}
        />
      </Box>
      <Typography
        component="p"
        style={{
        textAlign: 'center', margin: 10, alignSelf: 'center',
        }}
      >
        Tirando a gordito
      </Typography>,
    </Box>,
    <TextField
      onChange={(event) => {
 setName(event.target.value);
         }}
      id="name"
      label="Nombre"
      error={nameError}
      helperText={nameError ? 'Tenes que poner tu nombre' : ''}
      value={name}
      autoFocus
      className={classes.textField}
    />,
  ];

  return (
    <Container className={classes.boxContainer}>
      {success ? (
        <Typography
          variant="h5"
          component="div"
          style={{
          textAlign: 'center', margin: 10, alignSelf: 'center',
          }}
        >
          Gracias
        </Typography>
      ) : (
        <Box className={classes.headerButtonContainer}>
          <Typography
            variant="h5"
            component="div"
            style={{
            textAlign: 'center', margin: 10, alignSelf: 'center',
            }}
          >
            {titles[step]}
          </Typography>
          {steps[step]}
          <LoadingButton
            className={classes.button}
            loading={loading}
            onPress={() => {
            if (step === lastStep) {
              setNameError(false);
              postAnswer({
                    name, birthDate, birthHour, baldy, argenchino, weigth,
              });
            } else {
              setStep(step + 1);
            }
        }}
          >
            Continuar
          </LoadingButton>
        </Box>
      )}
    </Container>
  );
};
export default App;
