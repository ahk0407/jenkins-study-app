pipeline {
    agent any

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
                echo '데이터 등록(POST) 및 조회(GET)를 직접 검증합니다.'
                sh 'sleep 5'
                // 1. 헬스 체크
                sh 'docker exec my-web-app-server wget -qO- http://127.0.0.1:3000/health'
                
                // 2. [CREATE 검증] wget을 이용해 POST로 할 일 1개 추가
                sh '''
                    docker exec my-web-app-server wget --server-response --post-data='{"title":"Jenkins 파이프라인 자동등록 항목"}' \
                      --header='Content-Type: application/json' \
                      -qO- http://127.0.0.1:3000/api/todos
                '''

                // 3. [READ 검증] 등록된 TODO 목록 조회
                sh 'docker exec my-web-app-server wget -qO- http://127.0.0.1:3000/api/todos'
            }
        }
    }

    post {
        success {
            echo '✅ DB 연동 및 CRUD API 배포 검증 완료!'
        }
        failure {
            echo '❌ 파이프라인 실행 중 오류 발생'
        }
    }
}
