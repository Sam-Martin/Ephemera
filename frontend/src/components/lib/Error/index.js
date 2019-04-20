import React from 'react';
import {Container, Alert} from 'react-bootstrap';
import _ from 'lodash'

function Error(props){
  let message='Error'
  if(!_.isNil(props.message)){
   message=props.message.toString()
  }
  return(
    <Container>
      <Alert variant="danger">
        {message}
      </Alert>
      {props.additionalElements &&
      props.additionalElements}
    </Container>
  )
}

export default Error
