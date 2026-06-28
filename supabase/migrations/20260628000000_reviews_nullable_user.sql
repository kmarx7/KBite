-- 소비자 계정 도입 전 단계: 비회원 리뷰 허용
-- user_id NOT NULL → nullable로 변경 (FK 유지, 향후 계정 연동 가능)

alter table public.reviews alter column user_id drop not null;

-- 비회원(anon) 리뷰: 서버 액션(service_role)이 직접 insert — RLS 우회
-- 추후 소비자 계정 도입 시 reviews_insert_own 정책으로 user_id 채워짐
