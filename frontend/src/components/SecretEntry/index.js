import React from 'react';
import {Container, Alert} from 'react-bootstrap';
import fetch from 'node-fetch'

import SecretEntryForm from './SecretEntryForm'
import SecretUrlDisplay from './SecretUrlDisplay'

class SecretEntry extends React.Component {
  constructor(props){
    super(props)
    this.saveSecret = this.saveSecret.bind(this)
    this.state = {
      loading: false
    }
  }
  apiPost(action, dict){
    this.setState(state => ({
      loading: true,
      error: false
    }));
    return fetch(this.props.apiUrl+action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dict)
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.setState(state => ({
        loading: false,
        error: false
      }))
      return responseData
    }).
    catch((error) => {
      if (error === 'TypeError: Failed to fetch'){
        error = 'Error submitting data'
      }
      this.setState(state => ({
        loading: false,
        error: true,
        errorMessage: error
      }))
    })

  }
  saveSecret(e){
    e.preventDefault()
    this.apiPost('addTextSecret', {secretText:e.target.secretText.value})
    .then((response) => {
      this.setState(state => ({
        secretId: response.key
      }))
    })
  }
  render() {
    return (
      <Container>
        {this.state.error &&
          <Alert variant="danger">
            {this.state.errorMessage.toString()}
          </Alert>
        }
        {!this.state.secretId &&
          <SecretEntryForm loading={this.state.loading} saveSecretHandler={this.saveSecret} />
        }
        {this.state.secretId &&
          <SecretUrlDisplay secretId={this.state.secretId}/>
        }
      </Container>
    )
  }
}
export default SecretEntry
