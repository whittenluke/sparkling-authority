-- Create product_ratings table for quick star ratings
create table public.product_ratings (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    rating smallint not null check (rating between 1 and 5),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(product_id, user_id)
);

-- Add updated_at trigger
create trigger handle_updated_at
    before update on public.product_ratings
    for each row
    execute function public.handle_updated_at();

-- Enable RLS
alter table public.product_ratings enable row level security;

-- Add RLS policies
create policy "Public ratings are viewable by everyone"
    on product_ratings for select
    using ( true );

create policy "Users can create ratings"
    on product_ratings for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own ratings"
    on product_ratings for update
    using ( auth.uid() = user_id );

-- Add indexes
create index idx_product_ratings_product_id on public.product_ratings(product_id);
create index idx_product_ratings_user_id on public.product_ratings(user_id); 