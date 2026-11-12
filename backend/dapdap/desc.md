JPA N+1 문제: 발생 원인과 해결 방법

1) 왜 발생하는가
- JPA 연관관계는 보통 LAZY 로딩을 사용합니다.
- 리스트로 부모 엔티티 N개를 가져온 뒤, 각 엔티티의 연관 필드를 접근하면 항목마다 추가 쿼리가 실행됩니다.
- 예: 게시글 목록을 가져온 뒤 `post.getAuthor().getNickname()`을 호출하면 게시글 N개 + 작성자 N개 쿼리가 실행될 수 있습니다.

2) 이 프로젝트에서 발생 가능 위치
- BoardService.listPosts():
  게시글 목록 조회 후 `p.getAuthor().getNickname()` 접근 → Post N개 + User N개 쿼리 가능
- BoardService.buildCommentTree():
  댓글 목록 조회 후 `comment.getAuthor().getNickname()` 접근 → Comment N개 + User N개 쿼리 가능

3) 확인 방법
- SQL 로그를 켜서 동일한 SELECT가 반복되는지 확인합니다.

4) 해결 방법
A. Fetch Join
- 연관 엔티티를 한 번에 로딩합니다.
- 예:
  @Query("select p from BoardPost p join fetch p.author order by p.createdAt desc")
  List<BoardPost> findAllWithAuthor();

B. @EntityGraph
- 필요한 연관을 선언적으로 로딩합니다.
- 예:
  @EntityGraph(attributePaths = "author")
  List<BoardPost> findAllByOrderByCreatedAtDesc();

C. Batch Size
- Lazy 로딩을 묶어서 가져옵니다.
- @BatchSize(size = 50) 또는 hibernate.default_batch_fetch_size 설정
- 완전한 해결이라기보다 튜닝에 가깝습니다.

D. DTO 전용 쿼리
- 필요한 컬럼만 조회해서 DTO로 반환합니다.
- 목록 API처럼 단순한 응답에 특히 유리합니다.

엔티티 인덱싱: 이유, 효과, 장단점

1) 왜 인덱스를 걸었는가
이 프로젝트의 인덱스는 자주 필터링/정렬/조인되는 컬럼에 맞춰 설계되었습니다.
실제 조회 패턴(Repository/Service 쿼리)에 대응하도록 구성되어 있습니다.

주요 테이블과 이유
- interviews 테이블
  - idx_interviews_user (user_id):
    사용자 기준으로 인터뷰 목록을 조회할 때 사용됩니다.
  - idx_interviews_portfolio (portfolio_id):
    포트폴리오 기반 인터뷰 필터에 사용됩니다.
  - idx_interviews_category (category_id):
    CS 인터뷰에서 카테고리 필터에 사용됩니다.
  - idx_interviews_status_created (status, created_at):
    상태 필터 + 생성일 정렬/조회에 유리합니다.

- interview_turns 테이블
  - idx_turns_interview_turn (interview_id, turn_index):
    인터뷰별 질문 턴을 순서대로 가져올 때 사용됩니다.
  - idx_turns_question (question_id):
    특정 질문과 연관된 턴을 찾는 조회에 유리합니다.
  - idx_turns_portfolio_question (portfolio_question_id):
    포트폴리오 질문 기반 조회에 유리합니다.
  - idx_turns_parent (parent_turn_id):
    꼬리질문 트리 조회에 유리합니다.

- analysis_jobs 테이블
  - idx_analysis_jobs_turn (interview_id, turn_id):
    인터뷰/턴별 분석 작업을 가져올 때 사용됩니다.
  - idx_analysis_jobs_status (status):
    상태별 작업 조회(배치/대시보드)에 유리합니다.

2) 얻을 수 있는 효과
- 인덱스 컬럼을 사용하는 필터/정렬 쿼리가 빨라집니다.
- 데이터가 커질수록 성능이 안정적으로 유지됩니다.
- IO와 CPU 사용량이 줄어들어 핫 엔드포인트 성능이 개선됩니다.

3) 단점과 트레이드오프
- 쓰기 성능(INSERT/UPDATE/DELETE)이 느려질 수 있습니다.
- 인덱스 저장 공간이 추가로 필요합니다.
- 잘못 설계된 인덱스는 사용되지 않으면서 쓰기만 느려질 수 있습니다.

4) 인덱스가 도움이 되지 않는 경우
- 쿼리 조건이 인덱스 컬럼과 맞지 않을 때
- 함수/패턴 검색으로 인덱스를 타지 못할 때
- 테이블이 너무 작아서 풀스캔이 더 빠를 때

5) 이 프로젝트 기준 실무 팁
- 실제 쿼리 패턴에 맞춰 인덱스를 유지합니다.
- 복합 인덱스는 “첫 컬럼 필터 + 두 번째 컬럼 정렬/필터” 조합일 때 효과가 큽니다.
- 느린 쿼리를 확인한 뒤 필요 인덱스를 추가하는 방식이 가장 안전합니다.
