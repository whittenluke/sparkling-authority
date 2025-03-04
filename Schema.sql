-- Schema.sql for SparklingAuthority.com
-- Note: This schema is designed for Supabase

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Profiles table (extends Supabase Auth users)
create table public.profiles (
    id uuid not null primary key,
    username citext unique not null,
    display_name text,
    bio text,
    website text,
    avatar_url text,
    is_admin boolean default false,
    reputation_score integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint fk_user
        foreign key (id)
        references auth.users (id)
        on delete cascade
);

-- Create a secure policy for profiles
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile"
    on profiles for update
    using ( auth.uid() = id );

-- Brands table
create table public.brands (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    description text,
    website text,
    country_of_origin text,
    founded_year integer,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Products table (sparkling waters)
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    brand_id uuid references public.brands(id) on delete cascade,
    name text not null,
    description text,
    flavor text[],
    carbonation_level smallint check (carbonation_level between 1 and 10),
    container_type text check (container_type in ('can', 'bottle', 'other')),
    container_size text,
    is_discontinued boolean default false,
    nutrition_info jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(brand_id, name)
);

-- Reviews table
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    overall_rating smallint not null check (overall_rating between 1 and 5),
    taste_rating smallint check (taste_rating between 1 and 5),
    carbonation_rating smallint check (carbonation_rating between 1 and 5),
    aftertaste_rating smallint check (aftertaste_rating between 1 and 5),
    review_text text not null,
    is_approved boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(product_id, user_id)
);

-- Articles table (for expert content)
create table public.articles (
    id uuid default uuid_generate_v4() primary key,
    author_id uuid references public.profiles(id) on delete cascade,
    title text not null,
    slug text unique not null,
    content text not null,
    excerpt text,
    status text check (status in ('draft', 'published', 'archived')) default 'draft',
    meta_description text,
    tags text[],
    notion_id text unique,
    published_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Comments table (for both articles and reviews)
create table public.comments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    content text not null,
    parent_id uuid references public.comments(id) on delete cascade,
    article_id uuid references public.articles(id) on delete cascade,
    review_id uuid references public.reviews(id) on delete cascade,
    is_approved boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    check (
        (article_id is null and review_id is not null) or
        (article_id is not null and review_id is null)
    )
);

-- Likes table (for articles, reviews, and comments)
create table public.likes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    article_id uuid references public.articles(id) on delete cascade,
    review_id uuid references public.reviews(id) on delete cascade,
    comment_id uuid references public.comments(id) on delete cascade,
    created_at timestamptz default now(),
    check (
        (article_id is not null and review_id is null and comment_id is null) or
        (article_id is null and review_id is not null and comment_id is null) or
        (article_id is null and review_id is null and comment_id is not null)
    ),
    unique(user_id, article_id, review_id, comment_id)
);

-- Create indexes for better query performance
create index idx_products_brand_id on public.products(brand_id);
create index idx_reviews_product_id on public.reviews(product_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_comments_article_id on public.comments(article_id);
create index idx_comments_review_id on public.comments(review_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_articles_author_id on public.articles(author_id);
create index idx_articles_slug on public.articles(slug);

-- Add carbonation level migration for existing tables
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_carbonation_level_check,
ALTER COLUMN carbonation_level TYPE smallint USING 
  CASE 
    WHEN carbonation_level = 'light' THEN 3
    WHEN carbonation_level = 'medium' THEN 6
    WHEN carbonation_level = 'strong' THEN 9
    ELSE NULL 
  END,
ADD CONSTRAINT products_carbonation_level_check 
  CHECK (carbonation_level BETWEEN 1 AND 10);

-- Add updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.brands
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.products
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.reviews
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.articles
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.comments
    for each row
    execute function public.handle_updated_at();

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- Add RLS policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Public brands are viewable by everyone"
    on brands for select
    using ( true );

create policy "Public products are viewable by everyone"
    on products for select
    using ( true );

create policy "Public reviews are viewable by everyone"
    on reviews for select
    using ( true );

create policy "Users can create reviews"
    on reviews for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own reviews"
    on reviews for update
    using ( auth.uid() = user_id );

create policy "Public articles are viewable by everyone"
    on articles for select
    using ( status = 'published' );

create policy "Authors can view all their articles"
    on articles for select
    using ( auth.uid() = author_id );

create policy "Public comments are viewable by everyone"
    on comments for select
    using ( true );

create policy "Users can create comments"
    on comments for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own comments"
    on comments for update
    using ( auth.uid() = user_id );

create policy "Public likes are viewable by everyone"
    on likes for select
    using ( true );

create policy "Users can manage their own likes"
    on likes for all
    using ( auth.uid() = user_id ); 