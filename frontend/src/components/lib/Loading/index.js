import React from 'react';
import {Container, Spinner} from 'react-bootstrap';

function Loading(props){
  return(
    <Container>
    <Spinner
      as="span"
      animation="grow"
      size="sm"
      role="status"
      aria-hidden="true"
    />
  </Container>
  )
}

export default Loading
