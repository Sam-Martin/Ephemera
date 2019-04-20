import React from 'react';
import {Container, Form, Button} from 'react-bootstrap';
import fetch from 'node-fetch'
import CopyToClipboard from 'react-copy-to-clipboard'

import Loading from '../lib/Loading'
import Error from '../lib/Error'

class SecretDisplay extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      secretText: null,
      error: null
    };
  }
  componentDidMount() {
    fetch(this.props.apiUrl+"/getSecret?key="+this.props.secretId)
      .then(response => response.json())
      .then((data) => {
        if ('message' in data){
          this.setState({error:data['message'].toString(), isLoading: false})
        }else{
          this.setState({ secretText: data['secretText'], isLoading: false})
        }
      })
      .catch(error => this.setState({ error: this.makeFriendlyError(error), isLoading: false }));;
  }
  makeFriendlyError(error){
    switch(error.toString()){
      case 'TypeError: Failed to fetch':
        return 'Failed to load secret'
      default:
        return error
    }
  }
  render(){
    if(this.state.isLoading){
      return(<Loading />)
    }
    if(this.state.error){
      return(<Error message={this.state.error} additionalElements={
        <Button variant="success" className="ml-1" onClick={this.props.newSecretHandler}>Add New Secret</Button>}/>)
    }
    return (
      <Container>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label><h1>Secret</h1></Form.Label>
          </Form.Group>
          <Form.Group>
            <Form.Control as="textarea" className="secretOutput" defaultValue={this.state.secretText} readOnly/>
          </Form.Group>
          <Form.Group>
            <CopyToClipboard text={this.secretText}>
              <Button>Copy Secret</Button>
            </CopyToClipboard>
            <Button variant="success" className="ml-1" onClick={this.props.newSecretHandler}>Add New Secret</Button>
          </Form.Group>
        </Form>
      </Container>
    )
  }
}

export default SecretDisplay
