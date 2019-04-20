import React from 'react';
import {Form, Button, Spinner} from 'react-bootstrap';

function SecretEntryForm(props){
  return (
    <Form onSubmit={props.saveSecretHandler}>
      <h1>Enter Secret</h1>
      <Form.Group controlId="formSecretText">
        <Form.Control as="textarea" placeholder="Enter secret here" name="secretText" disabled={props.loading}/>
      </Form.Group>
      <Button type="submit" disabled={props.loading}>
        {props.loading &&
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        }
        {props.loading ? ' Getting URL...' : 'Get URL'}
      </Button>
    </Form>
  )
}

export default SecretEntryForm
