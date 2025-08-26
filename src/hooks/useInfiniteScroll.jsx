// frontend-webmusic/src/hooks/useInfiniteScroll.jsx

import { useState, useCallback, useRef, useEffect } from "react";

const useInfiniteScroll = ({
                               fetcher,
                               initialPage = 1,
                               limit = 20,
                           }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    const observer = useRef();

    const loadMore = useCallback(async (currentPage) => {
        if (loading || !hasMore || error) return;
        setLoading(true);

        try {
            // response.data trả về từ axios có dạng { success: true, message: '...', data: { content: [], pageInfo: {} } }
            const response = await fetcherRef.current({ page: currentPage, limit });

            // SỬA LỖI Ở ĐÂY: Lấy dữ liệu từ đúng đường dẫn
            const responseData = response.data?.content || [];
            const pageInfo = response.data?.pageInfo;

            // Kiểm tra để đảm bảo responseData là một mảng
            if (!Array.isArray(responseData)) {
                console.error("Fetcher did not return an array in data.content:", responseData);
                setHasMore(false);
                throw new Error("Invalid data format from API");
            }

            setItems((prevItems) =>
                currentPage === initialPage ? responseData : [...prevItems, ...responseData]
            );

            let hasNextPage = true;
            if (pageInfo) {
                // Spring Pageable trả về 'page' là 0-indexed, 'totalPages' là 1-indexed
                hasNextPage = pageInfo.hasNext !== undefined ? pageInfo.hasNext : (pageInfo.page < pageInfo.totalPages - 1);
            } else {
                // Fallback nếu không có pageInfo
                hasNextPage = responseData.length === limit;
            }
            setHasMore(hasNextPage);

            if (hasNextPage) {
                setPage(currentPage + 1);
            }

        } catch (err) {
            console.error("Failed to fetch data in useInfiniteScroll:", err);
            setError(err);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, error, initialPage, limit]);

    const lastElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !error) {
                    loadMore(page);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, page, loadMore, error]
    );

    const reset = useCallback(() => {
        setItems([]);
        setPage(initialPage);
        setHasMore(true);
        setError(null);
        setLoading(false);
    }, [initialPage]);

    useEffect(() => {
        if (items.length === 0 && hasMore && !loading && !error) {
            loadMore(initialPage);
        }
    }, [items.length, hasMore, loading, error, initialPage, loadMore]);

    return { items, loading, hasMore, error, lastElementRef, reset };
};

export default useInfiniteScroll;