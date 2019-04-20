import React from 'react';
import {Form, Button} from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard'

class SecretUrlDisplay extends React.Component {
  secretUrl(){
    return window.location.origin + '/?secretId=' + this.props.secretId
  }
  render() {
    return(
      <div>
        <Form.Group>
            <Form.Label><h1>Secret URL</h1></Form.Label>
          <Form.Control type="text" defaultValue={this.secretUrl()} name="secretUrl" />
        </Form.Group>
        <Form.Group>
          <CopyToClipboard text={this.secretUrl()}>
            <Button>Copy URL</Button>
          </CopyToClipboard>
          <Button variant="success" className="ml-1">Add New Secret</Button>
        </Form.Group>
      </div>
    )
  }
}

export default SecretUrlDisplay
