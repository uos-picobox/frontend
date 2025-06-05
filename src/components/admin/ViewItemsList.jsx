// src/components/admin/ViewItemsList.js
import React from "react";
import styled from "styled-components";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import Button from "../common/Button";

const ListWrapper = styled.div`
  width: 100%;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ListTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[3]};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

const ItemInfo = styled.div`
  flex-grow: 1;
  margin-right: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  strong {
    color: ${({ theme }) => theme.colors.primaryLight};
    font-weight: 500;
  }

  .detail {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textLighter};
    display: block;
    margin-top: ${({ theme }) => theme.spacing[1]};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ActionButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[1.5]}
    ${({ theme }) => theme.spacing[2]}; // Smaller buttons
  font-size: ${({ theme }) => theme.fontSizes.xs};

  svg {
    width: 14px;
    height: 14px;
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
`;

const NoItemsText = styled.p`
  color: ${({ theme }) => theme.colors.textLighter};
  padding: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

/**
 * ViewItemsList - A generic component to display lists of items with edit/delete actions.
 * @param {object} props
 * @param {string} props.title - Title for the list section.
 * @param {Array<object>} props.items - Array of items to display.
 * @param {function} props.renderItem - Function to render the main text for an item. (item) => string | JSX.Element
 * @param {function} [props.onEdit] - Optional: (item) => void. If provided, shows an Edit button.
 * @param {function} [props.onDelete] - Optional: (item) => void. If provided, shows a Delete button.
 * @param {function} [props.onAddItem] - Optional: () => void. If provided, shows an "Add New" button in header.
 * @param {string} [props.addItemLabel] - Label for the "Add New" button.
 * @param {boolean} [props.isLoading] - If data is currently loading.
 * @param {string|null} [props.error] - Error message if data fetching failed.
 */
const ViewItemsList = ({
  title,
  items,
  renderItem,
  onEdit,
  onDelete,
  onAddItem,
  addItemLabel = "새 항목 추가",
  isLoading,
  error,
}) => {
  if (isLoading) {
    return <NoItemsText>데이터를 불러오는 중...</NoItemsText>;
  }

  if (error) {
    return <NoItemsText>오류: {error}</NoItemsText>;
  }

  return (
    <ListWrapper>
      <ListHeader>
        <ListTitle>{title}</ListTitle>
        {onAddItem && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddItem}
            iconLeft={<PlusCircle size={16} />}
          >
            {addItemLabel}
          </Button>
        )}
      </ListHeader>
      {items && items.length > 0 ? (
        <ItemList>
          {items.map(
            (
              item,
              index // Assuming item has a unique 'id' or use index as last resort for key
            ) => (
              <ListItem
                key={
                  item.id ||
                  item.movieId ||
                  item.roomId ||
                  item.actorId ||
                  item.genreId ||
                  item.ratingId ||
                  item.distributorId ||
                  item.ticketTypeId ||
                  item.screeningId ||
                  index
                }
              >
                <ItemInfo>{renderItem(item)}</ItemInfo>
                <ActionButtons>
                  {onEdit && (
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                      iconLeft={<Edit size={14} />}
                    >
                      수정
                    </ActionButton>
                  )}
                  {onDelete && (
                    <ActionButton
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(item)}
                      iconLeft={<Trash2 size={14} />}
                    >
                      삭제
                    </ActionButton>
                  )}
                </ActionButtons>
              </ListItem>
            )
          )}
        </ItemList>
      ) : (
        <NoItemsText>등록된 항목이 없습니다.</NoItemsText>
      )}
    </ListWrapper>
  );
};

export default ViewItemsList;
