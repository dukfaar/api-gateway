pipeline {
  agent {
      docker {
        image 'node:alpine'
      }
  }
  stages {
    stage('Install') { 
      steps {
        sh 'npm install' 
      }
    }

    stage('Test') { 
      steps {
        sh 'npm test' 
      }
    }

    stage('Build') { 
      steps {
        sh 'npm run build' 
      }
    }      

    stage('Build Docker Image') { 
      steps {
        script {
          docker.build('dukfaar/api-gateway')
        }
      }
    }      
  }
}
