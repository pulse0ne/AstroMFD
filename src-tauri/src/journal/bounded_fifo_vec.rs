use std::collections::VecDeque;

#[derive(Clone)]
pub struct BoundedFifoVec<T: Clone> {
    data: VecDeque<T>,
    capacity: usize,
}

impl<T: Clone> BoundedFifoVec<T> {
    pub fn new(capacity: usize) -> Self {
        BoundedFifoVec {
            data: VecDeque::with_capacity(capacity),
            capacity,
        }
    }

    pub fn push(&mut self, item: T) {
        if self.data.len() == self.capacity {
            self.data.pop_front();
        }
        self.data.push_back(item);
    }

    pub fn push_all(&mut self, items: Vec<T>) {
        for item in items { self.push(item); } // TODO: optimize
    }

    pub fn clear(&mut self) {
        self.data.clear();
    }

    pub fn snapshot(&self) -> Vec<T> {
        self.data.iter().cloned().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn push_within_capacity() {
        let mut buf = BoundedFifoVec::new(3);
        buf.push(1);
        buf.push(2);
        buf.push(3);
        assert_eq!(buf.snapshot(), vec![1, 2, 3]);
    }

    #[test]
    fn push_evicts_oldest_when_full() {
        let mut buf = BoundedFifoVec::new(3);
        buf.push(1);
        buf.push(2);
        buf.push(3);
        buf.push(4);
        assert_eq!(buf.snapshot(), vec![2, 3, 4]);
    }

    #[test]
    fn push_all_respects_capacity() {
        let mut buf = BoundedFifoVec::new(3);
        buf.push_all(vec![10, 20, 30, 40, 50]);
        assert_eq!(buf.snapshot(), vec![30, 40, 50]);
    }

    #[test]
    fn clear_empties_buffer() {
        let mut buf = BoundedFifoVec::new(5);
        buf.push_all(vec![1, 2, 3]);
        buf.clear();
        assert_eq!(buf.snapshot(), Vec::<i32>::new());
    }

    #[test]
    fn capacity_one() {
        let mut buf = BoundedFifoVec::new(1);
        buf.push("a");
        buf.push("b");
        assert_eq!(buf.snapshot(), vec!["b"]);
    }

    #[test]
    fn snapshot_does_not_consume() {
        let mut buf = BoundedFifoVec::new(3);
        buf.push(1);
        buf.push(2);
        let s1 = buf.snapshot();
        let s2 = buf.snapshot();
        assert_eq!(s1, s2);
    }
}
