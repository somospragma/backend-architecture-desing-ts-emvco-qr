import { find_path } from '../../../domain/qr/infrastructure/dijkstra';
// @ts-ignore
import * as dijkstrajs from 'dijkstrajs';

jest.mock('dijkstrajs', () => ({
    find_path: jest.fn(),
}));

describe('Dijkstra Wrapper', () => {
    it('should call dijkstrajs.find_path', () => {
        const graph = { a: { b: 1 } };
        const path = ['a', 'b'];
        (dijkstrajs.find_path as jest.Mock).mockReturnValue(path);

        const result = find_path(graph, 'a', 'b');
        expect(result).toBe(path);
        expect(dijkstrajs.find_path).toHaveBeenCalledWith(graph, 'a', 'b');
    });
});
