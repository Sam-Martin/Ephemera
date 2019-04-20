import React from 'react';
import {Container, Form, Button} from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard'

function SecretDisplay(props){
  return (
    <Container>
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Label><h1>Secret</h1></Form.Label>
        </Form.Group>
        <Form.Control as="textarea" placeholder="Loading..." className="secretOutput" />
      </Form>
    </Container>
  )
}

export default SecretDisplay
