<template>
	<div class="table-variant-a">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.table-variant-a {
		&:deep(.ui-table__wrapper) {
			border: unset;
			border-radius: 24px;
			background-color: rgba(247, 249, 251, 1);
			padding: 4px 4px 0 4px;
			.ui-table,
			table {
				border-collapse: separate;
				border-spacing: 0 4px;
			}
			.ui-table__header {
				box-shadow: unset;
				th {
					height: unset;
					line-height: unset;
					padding: 12px 16px;
				}
			}
			.ui-table__body-row {
				box-shadow: unset;
				background-color: unset;
				&:last-child {
					td:first-child {
						.ui-table__body-cell-inner {
							border-radius: 10px 0 0 20px;
						}
					}
					td:last-child {
						.ui-table__body-cell-inner {
							border-radius: 0 10px 20px 0;
						}
					}
				}
				td {
					height: 1px;
					padding: 0;
					vertical-align: top;
					&:first-child {
						.ui-table__body-cell-inner {
							border-radius: 10px 0 0 10px;
						}
					}
					&:last-child {
						.ui-table__body-cell-inner {
							border-radius: 0 10px 10px 0;
							padding: 6px 6px 6px 16px;
						}
					}
					.ui-table__body-cell-inner {
						padding: 6px 16px;
						display: flex;
						align-items: center;
						width: 100%;
						height: 100%;
						min-height: 100%;
						background-color: $white;
						line-height: unset;
						color: rgba(48, 51, 69, 1);
						font-size: 14px;
						font-weight: 500;
					}
				}
			}
		}
	}
</style>
