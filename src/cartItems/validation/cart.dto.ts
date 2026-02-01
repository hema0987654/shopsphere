class CartDto {
    private validateNumber(value: number, name: string) {
        if (value == null || value <= 0) throw new Error(`Invalid ${name}`);
    }

    async userId(userId: number): Promise<void> {
        this.validateNumber(userId, "user ID");
    }

    async productId(productId: number): Promise<void> {
        this.validateNumber(productId, "product ID");
    }

    async quantity(quantity: number): Promise<void> {
        this.validateNumber(quantity, "quantity");
    }

    async cartId(cartId: number): Promise<void> {
        this.validateNumber(cartId, "cart ID");
    }

    async verifyOwnership(cartId: number, userId: number): Promise<void> {
        this.validateNumber(cartId, "cart ID");
        this.validateNumber(userId, "user ID");
    }

    async validateUpdate(data: { cartId: number; quantity: number }) {
        await this.cartId(data.cartId);
        await this.quantity(data.quantity);
    }

    async validateAddItem(data: { userId: number; productId: number; quantity: number }) {
        await this.userId(data.userId);
        await this.productId(data.productId);
        await this.quantity(data.quantity);
    }
}

export default new CartDto();
