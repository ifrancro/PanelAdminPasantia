pipeline {
    agent { 
        node {
            label 'server102' 
        }
    }
    options { 
        skipDefaultCheckout()
        disableConcurrentBuilds()
    }

    environment {
        MY_BRANCH = "qa"
        MY_WS = '/usr/src/dev/misterquillo/misterquillo'
    }
    
    stages {
        stage ('Load hash commit') {
            steps {
                script {
                    def scmAction = currentBuild.rawBuild.getAction(jenkins.scm.api.SCMRevisionAction.class)
                    if (scmAction) {
                        env.MY_GIT_COMMIT = scmAction.getRevision().getHash()
                    } else {
                        error("No se pudo obtener SCMRevisionAction: ¿el job es realmente Multibranch/Organization Folder?")
                    }
                    echo "Commit objetivo (qa): ${env.MY_GIT_COMMIT}"
                }
            }
        }

        stage ('Prepare and update sources') {
            steps {
                dir ("${MY_WS}") {
                    script {
                        env.CURRENT_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    }
                    echo "${env.CURRENT_COMMIT} - Current commit"
                    withCredentials([gitUsernamePassword(credentialsId: 'github-shinseiki')]) {
                        sh "git checkout *"
                        sh "git fetch origin ${MY_BRANCH}"
                        sh "git checkout ${MY_GIT_COMMIT}"
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir ("${MY_WS}") {
                    sh 'docker compose build'
                }
            }
        }

        stage('Update image') {
            steps {
                dir ("${MY_WS}") {
                    sh 'docker compose up -d'
                }
            }
        }
    }

    post {
        success {
            echo "Actualizaion OK."
        }
        failure {
            dir ("${MY_WS}") {
                withCredentials([gitUsernamePassword(credentialsId: 'github-shinseiki')]) {
                    sh "git checkout ${CURRENT_COMMIT}"
                }
            }
            echo 'El pipeline fallo. Revisar los logs de la etapa correspondiente.'
        }
    }
}
