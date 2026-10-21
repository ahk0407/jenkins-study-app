pipeline {
    agent any

    environment {
        DISCORD_WEBHOOK = credentials('DISCORD_WEBHOOK_URL')
    }

    stages {
        stage('Docker 이미지 빌드') {
            steps {
                echo 'Node.js 애플리케이션 이미지를 빌드합니다.'
                sh 'docker build -t my-node-app:latest .'
            }
        }

        stage('단위 테스트 실행 (CI)') {
            steps {
                echo '빌드된 컨테이너 내부에서 단위 테스트를 수행합니다.'
                sh 'docker run --rm my-node-app:latest npm test'
            }
        }

        stage('데이터베이스 및 네트워크 준비') {
            steps {
                echo '도커 네트워크 및 PostgreSQL 컨테이너를 구동합니다.'
                sh '''
                    docker network inspect app-net >/dev/null 2>&1 || docker network create app-net

                    if [ ! $(docker ps -q -f name=my-postgres-db) ]; then
                        docker run -d --name my-postgres-db \
                          --network app-net \
                          -p 5432:5432 \
                          -e POSTGRES_USER=admin \
                          -e POSTGRES_PASSWORD=password123 \
                          -e POSTGRES_DB=study_db \
                          -v pgdata:/var/lib/postgresql/data \
                          --restart=always \
                          postgres:15-alpine
                    fi
                '''
            }
        }

        stage('API 컨테이너 배포 (CD)') {
            steps {
                echo '기존 앱 컨테이너를 교체하고 네트워크에 연결해 배포합니다.'
                sh '''
                    if [ $(docker ps -aq -f name=my-web-app-server) ]; then
                        docker rm -f my-web-app-server
                    fi
                    docker run -d --name my-web-app-server \
                      --network app-net \
                      -p 8082:3000 \
                      -e DB_HOST=my-postgres-db \
                      -e DB_USER=admin \
                      -e DB_PASSWORD=password123 \
                      -e DB_NAME=study_db \
                      --restart=always \
                      my-node-app:latest
                '''
            }
        }

        stage('헬스 체크 및 CRUD 검증') {
            steps {
                echo '데이터 등록 및 조회를 검증합니다.'
                sh 'sleep 5'
                sh 'docker exec my-web-app-server wget -qO- http://127.0.0.1:3000/health'
            }
        }
    }

    post {
        success {
            echo '디스코드로 성공 알림을 전송합니다.'
            sh '''
                curl -H "Content-Type: application/json" \
                     -X POST \
                     -d "{
                           \\"embeds\\": [{
                             \\"title\\": \\"✅ CI/CD 배포 성공\\",
                             \\"description\\": \\"**프로젝트:** ${JOB_NAME}\\\\n**빌드 번호:** #${BUILD_NUMBER}\\\\n**상태:** 운영 배포 완료\\\\n[배포 서비스 확인](http://localhost:8082)\\",
                             \\"color\\": 3066993
                           }]
                         }" \
                     $DISCORD_WEBHOOK
            '''
        }
        failure {
            echo '디스코드로 실패 알림을 전송합니다.'
            sh '''
                curl -H "Content-Type: application/json" \
                     -X POST \
                     -d "{
                           \\"embeds\\": [{
                             \\"title\\": \\"❌ CI/CD 파이프라인 실패\\",
                             \\"description\\": \\"**프로젝트:** ${JOB_NAME}\\\\n**빌드 번호:** #${BUILD_NUMBER}\\\\n**상태:** 빌드 또는 테스트 실패로 배포 중단\\",
                             \\"color\\": 15158332
                           }]
                         }" \
                     $DISCORD_WEBHOOK
            '''
        }
    }
}
