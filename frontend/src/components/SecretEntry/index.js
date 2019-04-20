import React from 'react';
import {Container} from 'react-bootstrap';
import fetch from 'node-fetch'

import SecretEntryForm from './SecretEntryForm'
import SecretUrlDisplay from './SecretUrlDisplay'
import Error from '../lib/Error'

class SecretEntry extends React.Component {
  constructor(props){
    super(props)
    this.saveSecret = this.saveSecret.bind(this)
    this.newSecret = this.newSecret.bind(this)
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
    this.apiPost('/addTextSecret', {secretText:e.target.secretText.value})
    .then((response) => {
      this.setState(state => ({
        secretId: response.key
      }))
    })
  }
  newSecret(){
    this.setState({
      error:false,
      loading:false,
      secretId:false
    })
  }
  render() {
    return (
      <Container>
        {this.state.error &&
          <Error message={this.state.errorMessage.toString()} />
        }
        {!this.state.secretId &&
          <SecretEntryForm loading={this.state.loading} saveSecretHandler={this.saveSecret} />
        }
        {this.state.secretId &&
          <SecretUrlDisplay secretId={this.state.secretId} newSecretHandler={this.newSecret}/>
        }
      </Container>
    )
  }
}
export default SecretEntry
