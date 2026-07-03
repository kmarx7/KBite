-- 사업자 인증 서류 (할랄 인증서 등)
-- 비공개 버킷 — 읽기는 관리자 화면에서 service_role 서명 URL로만.
-- 업로드는 서버 액션(service_role)에서만 수행, 클라이언트 직접 접근 불가.
insert into storage.buckets (id, name, public)
values ('cert-documents', 'cert-documents', false)
on conflict (id) do nothing;

-- 인증서 파일 경로 (버킷 내 경로만 저장, URL 아님)
-- 컬럼 UPDATE GRANT에 포함하지 않음 → 소유자도 직접 변경 불가 (서버 전용)
alter table public.restaurants
  add column if not exists cert_file_path text;
